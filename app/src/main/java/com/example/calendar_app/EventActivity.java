package com.example.calendar_app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

public class EventActivity extends Activity {

    private EditText etEvent;
    private Button btnSaveEvent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_event);

        etEvent = findViewById(R.id.etEvent);
        btnSaveEvent = findViewById(R.id.btnSaveEvent);

        btnSaveEvent.setOnClickListener(v -> {
            String eventText = etEvent.getText().toString().trim();
            if (!eventText.isEmpty()) {
                Intent resultIntent = new Intent();
                resultIntent.putExtra("event", eventText);
                setResult(RESULT_OK, resultIntent);
                finish(); // 返回主页面
            }
        });
    }
}
