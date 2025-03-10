plugins {
    // 方式一：若已在 settings.gradle.kts 中声明版本，这里可以省略 version:
    id("com.android.application")

    // 如果要用 Kotlin，则加：
    // id("org.jetbrains.kotlin.android")

    // 方式二：若未在 settings.gradle.kts 声明，可在这里指定版本:
    // id("com.android.application") version "8.1.0"
    // id("org.jetbrains.kotlin.android") version "1.8.22"
}

android {
    namespace = "com.example.calendar_app" // 包名/命名空间
    compileSdk = 33

    defaultConfig {
        applicationId = "com.example.calendar_app"
        minSdk = 21
        targetSdk = 33
        versionCode = 1
        versionName = "1.0"
    }

    // 启用 Java 8，用于 LocalDate 等
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}


dependencies {
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.9.0")

    // MaterialCalendarView
}