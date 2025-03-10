package com.example.calendar_app;  // Replace with your actual package name

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.EditText;
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
    private EditText etTask;
    private Button btnAddTask;

    // Store date -> list of tasks
    private HashMap<String, ArrayList<String>> taskMap = new HashMap<>();

    // The currently selected date in "yyyy-MM-dd" format
    private String selectedDateStr;

    // The adapter for the ListView
    private ArrayAdapter<String> adapter;
    // The current tasks for the selected date
    private ArrayList<String> currentTasks;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Bind UI components
        calendarView = findViewById(R.id.calendarView);
        tvSelectedDate = findViewById(R.id.tvSelectedDate);
        lvTasks = findViewById(R.id.lvTasks);
        etTask = findViewById(R.id.etTask);
        btnAddTask = findViewById(R.id.btnAddTask);

        // Initialize the selected date to "today"
        long todayMillis = calendarView.getDate();
        selectedDateStr = convertMillisToDateString(todayMillis);
        tvSelectedDate.setText("Selected Date: " + selectedDateStr);

        // Make sure we have a list for today's date
        taskMap.putIfAbsent(selectedDateStr, new ArrayList<String>());
        currentTasks = taskMap.get(selectedDateStr);

        // Set up the ListView with an ArrayAdapter
        adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_list_item_1,
                currentTasks
        );
        lvTasks.setAdapter(adapter);

        // Listen to date changes on the CalendarView
        calendarView.setOnDateChangeListener(new CalendarView.OnDateChangeListener() {
            @Override
            public void onSelectedDayChange(
                    @NonNull CalendarView view,
                    int year,
                    int month,
                    int dayOfMonth
            ) {
                // month starts from 0
                String dateStr = String.format(Locale.getDefault(), "%04d-%02d-%02d",
                        year, (month + 1), dayOfMonth);
                selectedDateStr = dateStr;
                tvSelectedDate.setText("Selected Date: " + selectedDateStr);

                // If we have no tasks for this date yet, create an empty list
                taskMap.putIfAbsent(selectedDateStr, new ArrayList<String>());
                currentTasks = taskMap.get(selectedDateStr);

                // Refresh the ListView data
                adapter.clear();
                adapter.addAll(currentTasks);
                adapter.notifyDataSetChanged();
            }
        });

        // Click "Add Task" button to append new tasks
        btnAddTask.setOnClickListener(v -> {
            String newTask = etTask.getText().toString().trim();
            if (!newTask.isEmpty()) {
                // Add the new task to the current date's list
                taskMap.get(selectedDateStr).add(newTask);

                // Refresh the adapter so the new task is visible
                adapter.clear();
                adapter.addAll(taskMap.get(selectedDateStr));
                adapter.notifyDataSetChanged();

                // Clear the input field
                etTask.setText("");
            }
        });
    }

    // Convert milliseconds (from CalendarView) to "yyyy-MM-dd" format
    private String convertMillisToDateString(long millis) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        return sdf.format(millis);
    }
}
