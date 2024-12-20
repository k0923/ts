import { useState, useEffect } from 'react'
import { Path } from './context'

/**
 * React functional component type for form nodes with a path prop
 */
export type FormNode = React.FC<{ path: Path }>

/**
 * Generic data handler type for handling value changes
 */
export type DataHandler<T = any> = (v: T) => void

/**
 * Handler type for processing value changes with access to previous value
 */
export type ValueHandler<Value = any> = (value: Value, last: Value) => Value

/**
 * Configuration interface for BaseEditor
 */
export interface BaseEditorConfig<Value = any> {
    /**
     * Optional handler for custom value processing
     */
    valueHandler?: ValueHandler<Value>
}

/**
 * Abstract base class for form editors
 * Provides core functionality for managing form state, value processing, and parent-child relationships
 * @template Value The type of value being edited
 */
export abstract class BaseEditor<out Value = any> {
    /**
     * Reference to parent editor instance
     */
    protected _parent: BaseEditor | null = null

    /**
     * Map of data handlers for managing state updates
     */
    protected hooks: Map<string, DataHandler<any>> = new Map()

    /**
     * Process a value before it's set in the editor
     * @param value Current value being processed
     * @param lastValue Previous value
     * @returns Processed value
     */
    processValue(value: Value, lastValue: Value): Value {
        return value
    }

    /**
     * Build and return a React form node component
     */
    abstract build(): FormNode

    /**
     * Get the parent editor instance
     */
    get parent(): BaseEditor | null {
        return this._parent
    }

    /**
     * Refresh the editor state with a new value
     * @param path Path to the value being updated
     * @param value New value
     */
    refresh(path: Path, value: any) {
        path.setValue(value)
        this.hooks.get(path.path.join('.'))?.(value)
    }

    /**
     * Set a value in the editor, processing it through the editor hierarchy
     * @param path Path to set the value at
     * @param value Value to set
     */
    protected setValue(path: Path, value: Value) {
        const targetEditor: { editor: BaseEditor; path: Path; value: Value } = {
            editor: this,
            path: path,
            value: value,
        }
        let currentEditor: BaseEditor = this
        let currentValue = value
        while (true) {
            const lastValue = path.value
            const v = currentEditor.processValue(currentValue, lastValue)
            if (!Object.is(v, currentValue)) {
                targetEditor.editor = currentEditor
                targetEditor.path = path
                targetEditor.value = v
            }
            currentValue = v

            if (!currentEditor.parent || !path.parent) {
                break
            }
            const parentValue = path.parent.value
            currentValue = path.buildParent(parentValue, currentValue)
            path = path.parent
            currentEditor = currentEditor.parent
        }
        targetEditor.editor.refresh(targetEditor.path, targetEditor.value)
    }

    /**
     * Set the parent editor instance
     * @param parent Parent editor to set
     */
    setParent(parent: BaseEditor): void {
        this._parent = parent
    }

    /**
     * React hook for managing editor node state
     * Sets up effect for handling value updates and cleanup
     * @param path Path to the node
     * @returns Current value at the path
     */
    protected useVersion(path: Path): void {
        const [_, setVersion] = useState<number>(0)
        useEffect(() => {
            const pathStr = path.path.flat().join('.')
            this.hooks.set(pathStr, () => setVersion(x => x + 1))
            return () => {
                this.hooks.delete(pathStr)
            }
        }, [path.path.join('.')])
    }
}
