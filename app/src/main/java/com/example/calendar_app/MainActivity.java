package com.example.calendar_app;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.ListView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private CalendarView calendarView;
    private TextView tvSelectedDate;
    private ListView lvTasks;
    private Button btnNewEvent;

    private final HashMap<String, ArrayList<String>> taskMap = new HashMap<>();
    private String selectedDateStr;
    private ArrayList<String> currentTasks;
    private ArrayAdapter<String> adapter;

    private static final int REQUEST_CODE_NEW_EVENT = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        calendarView = findViewById(R.id.calendarView);
        tvSelectedDate = findViewById(R.id.tvSelectedDate);
        lvTasks = findViewById(R.id.lvTasks);
        btnNewEvent = findViewById(R.id.btnNewEvent);

        long todayMillis = calendarView.getDate();
        selectedDateStr = convertMillisToDateString(todayMillis);
        tvSelectedDate.setText("Selected Date: " + selectedDateStr);

        if (!taskMap.containsKey(selectedDateStr)) {
            taskMap.put(selectedDateStr, new ArrayList<>());
        }
        currentTasks = taskMap.get(selectedDateStr);

        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, currentTasks);
        lvTasks.setAdapter(adapter);

        calendarView.setOnDateChangeListener((@NonNull CalendarView view, int year, int month, int dayOfMonth) -> {
            selectedDateStr = String.format(Locale.getDefault(), "%04d-%02d-%02d", year, month + 1, dayOfMonth);
            tvSelectedDate.setText("Selected Date: " + selectedDateStr);

            if (!taskMap.containsKey(selectedDateStr)) {
                taskMap.put(selectedDateStr, new ArrayList<>());
            }
            currentTasks = taskMap.get(selectedDateStr);

            adapter.clear();
            adapter.addAll(currentTasks);
            adapter.notifyDataSetChanged();
        });

        btnNewEvent.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, EventActivity.class);
            startActivityForResult(intent, REQUEST_CODE_NEW_EVENT);
        });
    }

    private String convertMillisToDateString(long millis) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        return sdf.format(millis);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_CODE_NEW_EVENT && resultCode == RESULT_OK) {
            String newEvent = data.getStringExtra("event");
            if (newEvent != null && !newEvent.isEmpty()) {
                taskMap.get(selectedDateStr).add(newEvent);
                adapter.clear();
                adapter.addAll(taskMap.get(selectedDateStr));
                adapter.notifyDataSetChanged();
            }
        }
    }
}
