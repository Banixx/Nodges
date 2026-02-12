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
}
