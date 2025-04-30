#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "JP";
const char* password = "00000000";
const char* apiUrl = "http://cc43-2401-4900-67a0-d16c-c441-566f-342c-9e9d.ngrok-free.app/send";

String inputData;

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nConnected to WiFi!!");
}

void loop() {
  if (Serial.available()) {
    inputData = Serial.readStringUntil('\n');
    inputData.trim(); 

    if (inputData.length() > 0 && inputData.indexOf("nan") == -1) {
      Serial.println("Received: " + inputData);

        String jsonData = "{\"data\":\"" + inputData + "\"}";

        if (WiFi.status() == WL_CONNECTED) {
          WiFiClient client;
          HTTPClient http;

          http.begin(client, apiUrl);
          http.addHeader("Content-Type", "application/json");

          int httpResponseCode = http.POST(jsonData);

          if (httpResponseCode > 0) {
            Serial.println("POST Success, Code: " + String(httpResponseCode));
          } else {
            Serial.println("POST Failed, Code: " + String(httpResponseCode));
          }

          http.end();
        }
    } else {
      Serial.println("Empty or invalid data. Skipping.");
    }

    delay(2000); 
  }
}
