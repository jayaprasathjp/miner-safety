#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <PulseSensorPlayground.h>

#define HR_SENSOR_PIN A1
#define SMOKE_SENSOR_PIN A0
#define DHT_PIN 8         
#define BUZZER_PIN 6       
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

const int OUTPUT_TYPE = SERIAL_PLOTTER;
const int PULSE_INPUT = A1;
const int PULSE_BLINK = LED_BUILTIN;
const int PULSE_FADE = 5;
const int THRESHOLD = 550;

PulseSensorPlayground pulseSensor;
void setup() {
  Serial.begin(9600);
  lcd.init();
  lcd.begin(16, 2);
  lcd.backlight();
  dht.begin();
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(SMOKE_SENSOR_PIN, INPUT);
  
   pulseSensor.analogInput(PULSE_INPUT);
  pulseSensor.blinkOnPulse(PULSE_BLINK);
  pulseSensor.fadeOnPulse(PULSE_FADE);
  pulseSensor.setSerial(Serial);
  pulseSensor.setOutputType(OUTPUT_TYPE);
  pulseSensor.setThreshold(THRESHOLD);

  if (!pulseSensor.begin()) {
    while (true) {
      digitalWrite(PULSE_BLINK, LOW);
      delay(50);
      Serial.println('!');
      digitalWrite(PULSE_BLINK, HIGH);
      delay(50);
    }
  }
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();


  // Buzzer alert

    int bpm = pulseSensor.getBeatsPerMinute();
  int gasLevel = analogRead(SMOKE_SENSOR_PIN);
if (!isnan(temperature) && !isnan(humidity)) {
  String payload = "Prasath," + String(bpm) + "," + String(temperature, 2) + "," + String(humidity, 2) + "," + String(gasLevel);
  Serial.println(payload); 
  bool alert = false;
lcd.clear();

if (gasLevel > 400) {
  lcd.setCursor(0, 0);
  lcd.print("High Gas Alert!");
  lcd.print(" Gas:");
  lcd.print(gasLevel);
  lcd.print(bpm);
  alert = true;
} else if (bpm > 120) {
  lcd.setCursor(0, 0);
  lcd.print("High BPM Alert!");
  lcd.setCursor(0, 1);
  lcd.print("BPM:");
  lcd.print(bpm);
  alert = true;
} else if (temperature >= 36) {
  lcd.setCursor(0, 0);
  lcd.print("High Temp Alert!");
  lcd.setCursor(0, 1);
   lcd.print(" Temp:");
   lcd.print(temperature, 1); lcd.print((char)223); 
  alert = true;
} else if (humidity < 40) {
  lcd.setCursor(0, 0);
  lcd.print("High Humid Alert!");
  lcd.setCursor(0, 1);
  lcd.setCursor(0, 1);
  lcd.print("Hu:");
  lcd.print(humidity, 1); lcd.print("%");
  alert = true;
}

if (alert) {
  digitalWrite(BUZZER_PIN, HIGH);
} else {
  digitalWrite(BUZZER_PIN, LOW);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("BPM:");
  lcd.print(bpm);
  lcd.print(" Temp:");
   lcd.print(temperature, 1); lcd.print((char)223); 
  lcd.setCursor(0, 1);
  lcd.print("Hu:");
lcd.print(humidity, 1); lcd.print("%");
  lcd.print(" Gas:");
  lcd.print(gasLevel);

}}

  delay(2000);
}
