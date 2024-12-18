export interface ReactiveProps<T> {
    value: T
    onChange: (value: T) => void
}
