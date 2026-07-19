// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.2"),
        .package(name: "CapacitorFirebaseAuthentication", path: "..\..\..\node_modules\@capacitor-firebase\authentication"),
        .package(name: "CapacitorFirebaseMessaging", path: "..\..\..\node_modules\@capacitor-firebase\messaging"),
        .package(name: "CapacitorCamera", path: "..\..\..\node_modules\@capacitor\camera"),
        .package(name: "CapacitorFilesystem", path: "..\..\..\node_modules\@capacitor\filesystem"),
        .package(name: "CapacitorGeolocation", path: "..\..\..\node_modules\@capacitor\geolocation"),
        .package(name: "CapacitorHaptics", path: "..\..\..\node_modules\@capacitor\haptics"),
        .package(name: "CapacitorLocalNotifications", path: "..\..\..\node_modules\@capacitor\local-notifications"),
        .package(name: "CapacitorShare", path: "..\..\..\node_modules\@capacitor\share"),
        .package(name: "RevenuecatPurchasesCapacitor", path: "..\..\..\node_modules\@revenuecat\purchases-capacitor")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorFirebaseAuthentication", package: "CapacitorFirebaseAuthentication"),
                .product(name: "CapacitorFirebaseMessaging", package: "CapacitorFirebaseMessaging"),
                .product(name: "CapacitorCamera", package: "CapacitorCamera"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorGeolocation", package: "CapacitorGeolocation"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorLocalNotifications", package: "CapacitorLocalNotifications"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "RevenuecatPurchasesCapacitor", package: "RevenuecatPurchasesCapacitor")
            ]
        )
    ]
)
