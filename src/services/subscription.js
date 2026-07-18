import { Capacitor } from '@capacitor/core';
import { revenueCatKey, PLUS_ENTITLEMENT, isRevenueCatConfigured } from '../config/revenuecat';

// Estado de la suscripción Patitas Plus.
//
//  - Nativo + RevenueCat configurado → compras reales vía App Store (StoreKit).
//  - Cualquier otro caso → MODO PRUEBA: la compra se simula y persiste solo
//    en este dispositivo. Permite desarrollar y probar el paywall completo
//    antes de tener cuenta de Apple / RevenueCat.
//
// REGLA DE PRODUCTO: nada del rescate (alertas, mapa, avistamientos) se
// bloquea detrás de Plus. Plus vende prevención y conveniencia.

const TEST_KEY = 'pp-plus-test';

let plus = false;
let mode = 'test'; // 'revenuecat' | 'test'
const subs = new Set();

function emit() {
  subs.forEach((cb) => cb(plus));
}

export function isPlus() {
  return plus;
}

export function subscriptionMode() {
  return mode;
}

export function onPlusChange(cb) {
  subs.add(cb);
  return () => subs.delete(cb);
}

function setFromCustomerInfo(info) {
  plus = !!info?.entitlements?.active?.[PLUS_ENTITLEMENT];
  emit();
}

export async function initSubscription() {
  if (Capacitor.isNativePlatform() && isRevenueCatConfigured()) {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.configure({ apiKey: revenueCatKey() });
      await Purchases.addCustomerInfoUpdateListener(({ customerInfo }) =>
        setFromCustomerInfo(customerInfo),
      );
      const { customerInfo } = await Purchases.getCustomerInfo();
      mode = 'revenuecat';
      setFromCustomerInfo(customerInfo);
      return;
    } catch (err) {
      console.warn('RevenueCat no disponible; paywall en modo prueba:', err);
    }
  }
  mode = 'test';
  plus = localStorage.getItem(TEST_KEY) === '1';
  emit();
}

// Planes a mostrar. Con RevenueCat activo salen de la tienda (precio ya
// localizado por Apple); en modo prueba usamos precios de referencia en soles.
export async function getPlans() {
  if (mode === 'revenuecat') {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { offerings } = await Purchases.getOfferings();
      const packages = offerings?.current?.availablePackages ?? [];
      if (packages.length > 0) {
        return packages.map((pkg) => ({
          id: pkg.identifier,
          title: pkg.packageType === 'ANNUAL' ? 'Anual' : 'Mensual',
          price: pkg.product.priceString,
          period: pkg.packageType === 'ANNUAL' ? '/año' : '/mes',
          tag: pkg.packageType === 'ANNUAL' ? 'Mejor precio' : null,
          pkg,
        }));
      }
    } catch (err) {
      console.warn('No se pudieron cargar las ofertas:', err);
    }
  }
  return [
    { id: 'monthly', title: 'Mensual', price: 'S/ 9.90', period: '/mes', tag: null },
    { id: 'yearly', title: 'Anual', price: 'S/ 79.90', period: '/año', tag: 'Ahorra 33%' },
  ];
}

export async function purchase(plan) {
  if (mode === 'revenuecat' && plan?.pkg) {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: plan.pkg });
    setFromCustomerInfo(customerInfo);
    return plus;
  }
  localStorage.setItem(TEST_KEY, '1');
  plus = true;
  emit();
  return true;
}

export async function restorePurchases() {
  if (mode === 'revenuecat') {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.restorePurchases();
    setFromCustomerInfo(customerInfo);
    return plus;
  }
  plus = localStorage.getItem(TEST_KEY) === '1';
  emit();
  return plus;
}
