/**
 * Simple Dependency Injection Container
 * Manages service registration and retrieval to decouple components.
 */
export class ServiceContainer {
    private static instance: ServiceContainer;
    private services: Map<string, any>;

    private constructor() {
        this.services = new Map();
    }

    /**
     * Get the singleton instance of the container
     */
    static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    /**
     * Register a service instance
     * @param key Unique identifier for the service (e.g., interface name)
     * @param service The service instance
     */
    register<T>(key: string, service: T): void {
        if (this.services.has(key)) {
            console.warn(`[ServiceContainer] Overwriting existing service for key: ${key}`);
        }
        this.services.set(key, service);
    }

    /**
     * Retrieve a registered service
     * @param key Unique identifier for the service
     * @returns The requested service instance
     * @throws Error if service is not found
     */
    get<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`[ServiceContainer] Service not found: ${key}`);
        }
        return service;
    }

    /**
     * Check if a service is registered
     */
    has(key: string): boolean {
        return this.services.has(key);
    }

    /**
     * Clear all services (useful for testing)
     */
    reset(): void {
        this.services.clear();
    }

    /**
     * Helper to resolve multiple dependencies at once.
     * Use this in manager constructors.
     */
    resolve<T1, T2>(k1: string, k2: string): [T1, T2];
    resolve<T1, T2, T3>(k1: string, k2: string, k3: string): [T1, T2, T3];
    resolve<T1, T2, T3, T4>(k1: string, k2: string, k3: string, k4: string): [T1, T2, T3, T4];
    resolve<T1, T2, T3, T4, T5>(k1: string, k2: string, k3: string, k4: string, k5: string): [T1, T2, T3, T4, T5];
    resolve<T1, T2, T3, T4, T5, T6>(k1: string, k2: string, k3: string, k4: string, k5: string, k6: string): [T1, T2, T3, T4, T5, T6];
    resolve<T1, T2, T3, T4, T5, T6, T7>(k1: string, k2: string, k3: string, k4: string, k5: string, k6: string, k7: string): [T1, T2, T3, T4, T5, T6, T7];
    resolve<T1, T2, T3, T4, T5, T6, T7, T8>(k1: string, k2: string, k3: string, k4: string, k5: string, k6: string, k7: string, k8: string): [T1, T2, T3, T4, T5, T6, T7, T8];
    resolve(...keys: string[]): any[] {
        return keys.map(key => this.get(key));
    }
}
