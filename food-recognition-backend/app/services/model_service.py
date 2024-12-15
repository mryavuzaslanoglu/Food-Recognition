import tensorflow as tf
import numpy as np
from PIL import Image
import io
from typing import Tuple
import google.generativeai as genai
from app.core.config import settings
import logging

# Logging ayarları
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.interpreter = None
        self.class_names = []
        self._load_model()
        self._load_class_names()
        self._setup_gemini()

    def _load_model(self):
        try:
            self.interpreter = tf.lite.Interpreter(model_path=settings.MODEL_PATH)
            self.interpreter.allocate_tensors()
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            self.input_shape = self.input_details[0]['shape']
            logger.debug(f"Input details: {self.input_details}")
            logger.debug(f"Output details: {self.output_details}")
        except Exception as e:
            logger.error(f"Model yükleme hatası: {e}")
            raise

    def _load_class_names(self):
        try:
            with open(settings.CLASS_NAMES_PATH, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('#') or not line.strip():
                        continue
                    eng, tr = line.strip().split('|')
                    self.class_names.append(tr)
            logger.debug(f"Loaded {len(self.class_names)} class names")
        except Exception as e:
            logger.error(f"Sınıf isimleri yükleme hatası: {e}")
            raise

    def _setup_gemini(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model_gemini = genai.GenerativeModel('gemini-1.5-flash')
        else:
            logger.warning("GEMINI_API_KEY bulunamadı")

    def preprocess_image(self, image_data: bytes) -> Tuple[np.ndarray, Image.Image]:
        try:
            # Bytes'ı PIL Image'a dönüştür
            image = Image.open(io.BytesIO(image_data))

            # RGB'ye dönüştür
            if image.mode != 'RGB':
                image = image.convert('RGB')

            # Model için yeniden boyutlandır
            model_image = image.resize((224, 224))

            # NumPy dizisine dönüştür
            img_array = np.array(model_image, dtype=np.float32)
            logger.debug(f"Image array shape before processing: {img_array.shape}")

            # Normalizasyon
            img_array = img_array / 255.0

            # Batch boyutu ekle
            img_array = np.expand_dims(img_array, axis=0)
            logger.debug(f"Image array shape after processing: {img_array.shape}")

            return img_array, image

        except Exception as e:
            logger.error(f"Görüntü ön işleme hatası: {e}")
            raise

    def verify_and_get_food_info(self, image: Image.Image, model_prediction: str) -> Tuple[str, str]:
        try:
            # Görüntüyü byte dizisine çevir
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG')
            img_byte_arr = img_byte_arr.getvalue()

            prompt = (
                f"Bu fotoğraftaki yemek görüntüsünü analiz et. "
                f"Model bu yemeğin '{model_prediction}' olduğunu düşünüyor. "
                f"1. Bu tahmin doğru mu? Eğer yanlışsa, bu yemeğin ne olduğunu Türkçe adıyla yaz. "
                f"2. Bu yemeğin detaylı tarifini ver. "
                f"\nLütfen şu formatta cevap ver:\n"
                f"YEMEK_ADI: [Türkçe adı]\n"
                f"TARİF:\n"
                f"🍽️ MALZEMELER:\n"
                f"[Malzemeler listesi]\n\n"
                f"👨‍🍳 HAZIRLANIŞI:\n"
                f"[Adım adım tarif]\n\n"
                f"💡 PÜF NOKTALARI:\n"
                f"[Önemli ipuçları]"
            )

            # Gemini API'ye istek gönder ve zaman aşımını 60 saniye olarak ayarla
            response = self.model_gemini.generate_content([prompt, image], safety_settings={
                'HARM_CATEGORY_HARASSMENT': 'BLOCK_ONLY_HIGH',
                'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_ONLY_HIGH',
                'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_ONLY_HIGH',
                'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_ONLY_HIGH',
            }, stream=False)

            response.resolve()
            response_text = response.text
            # Tüm yanıtı log'a yazdır
            logger.debug(f"Gemini response: {response_text}")

            yemek_adi = "Tarif Bulunamadı"
            tarif = "Tarif Bulunamadı"

            lines = response_text.split('\n')
            
            yemek_adi_index = -1
            tarif_index = -1

            for i, line in enumerate(lines):
                if line.startswith("YEMEK_ADI:"):
                    yemek_adi_index = i
                elif line.startswith("TARİF:"):
                    tarif_index = i

            if yemek_adi_index != -1:
                yemek_adi = lines[yemek_adi_index].replace("YEMEK_ADI:", "").strip()

            if tarif_index != -1:
                tarif = "\n".join(lines[tarif_index:]).replace("TARİF:", "", 1).strip()

            # Değişkenleri ve türlerini yazdır
            logger.debug(f"Yemek adı: {yemek_adi}, Türü: {type(yemek_adi)}")
            logger.debug(f"Tarif: {tarif}, Türü: {type(tarif)}")

            return yemek_adi, tarif

        except Exception as e:
            logger.error(f"Gemini API hatası: {e}")
            return model_prediction, "Tarif alınamadı."

    async def predict(self, image_data: bytes) -> Tuple[str,str, float, str]:
        try:
            # Görüntüyü ön işle
            processed_image, original_image = self.preprocess_image(image_data)

            # Model tahminini yap
            self.interpreter.set_tensor(self.input_details[0]['index'], processed_image)
            self.interpreter.invoke()

            # Model çıktısını al ve boyutlarını kontrol et
            predictions = self.interpreter.get_tensor(self.output_details[0]['index'])
            logger.debug(f"Raw predictions shape: {predictions.shape}")
            logger.debug(f"Raw predictions: {predictions}")

            # Boyutları düzeltme
            predictions = np.squeeze(predictions)  # Fazla boyutları kaldır
            logger.debug(f"Squeezed predictions shape: {predictions.shape}")

            # En yüksek olasılıklı sınıfı bul
            predicted_class_index = int(np.argmax(predictions))
            confidence = float(predictions[predicted_class_index])
            logger.debug(f"Predicted class index: {predicted_class_index}")
            logger.debug(f"Confidence: {confidence}")

            # Model tahminini al
            if predicted_class_index >= len(self.class_names):
                logger.error(f"Predicted index {predicted_class_index} out of range for {len(self.class_names)} classes")
                raise ValueError("Invalid prediction index")

            model_prediction = self.class_names[predicted_class_index]
            logger.debug(f"Model prediction: {model_prediction}")

            # Gemini ile doğrula ve bilgi al
            yemek_adi, tarif = self.verify_and_get_food_info(
                original_image,
                model_prediction
            )

            # Değişkenleri ve türlerini yazdır
            logger.debug(f"Yemek adı: {yemek_adi}, Türü: {type(yemek_adi)}")
            logger.debug(f"Tarif: {tarif}, Türü: {type(tarif)}")

            return model_prediction, yemek_adi, confidence, tarif

        except Exception as e:
            logger.error(f"Tahmin hatası: {e}")
            raise

model_service = ModelService()