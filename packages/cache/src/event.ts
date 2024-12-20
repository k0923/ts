type EventFn<T> = (data?: T) => void

interface EventHook<T> extends EventFn<T> {
    once: (fn: EventFn<T>) => void
    add: (fn: EventFn<T>) => void
    remove: (fn: EventFn<T>) => void
    destroy: () => void
}

export type Events<T> = {
    [K in keyof T]: EventHook<T[K]>
}

export function CreateEventHub<Event>(): Events<Event> {
    type K = keyof Event

    const eventMap = new Map<K, Map<EventFn<Event[K]>, boolean>>()

    const getOrCreateEventSet = (key: K) => {
        let s = eventMap.get(key)
        if (!s) {
            s = new Map()
            eventMap.set(key, s)
        }
        return s
    }

    const proxyObj = new Proxy<Events<Event>>({} as Events<Event>, {
        get(target, key, receiver) {
            let handler = (target as any)[key as any]
            if (!handler) {
                handler = ((eventData: Event[K]) => {
                    const s = eventMap.get(key as K)
                    s?.forEach((once, cb) => {
                        try {
                            cb(eventData)
                        } catch (error) {
                            console.error(`Error in event handler for ${String(key)}:`, error)
                        }
                        once && s.delete(cb)
                    })
                }) as EventHook<Event[K]>

                handler.add = (fn: EventFn<Event[K]>) => {
                    getOrCreateEventSet(key as K).set(fn, false)
                }

                handler.once = (fn: EventFn<Event[K]>) => {
                    getOrCreateEventSet(key as K).set(fn, true)
                }

                handler.remove = (fn: EventFn<Event[K]>) => {
                    eventMap.get(key as K)?.delete(fn)
                }

                handler.destroy = () => {
                    eventMap.delete(key as K)
                }
                const t = target as any
                t[key as any] = handler
            }
            return handler
        },
    })

    return proxyObj
}
