"use client"

import * as React from "react"

// Stub implementation to fix build issues
export const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
  ({ ...props }, ref) => <form ref={ref} {...props} />
)
Form.displayName = "Form"

export const FormField = ({ render }: any) => render({ field: {} })
export const FormItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
export const FormLabel = ({ children }: { children: React.ReactNode }) => <label>{children}</label>
export const FormControl = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const FormDescription = ({ children }: { children: React.ReactNode }) => <p>{children}</p>
export const FormMessage = ({ children }: { children?: React.ReactNode }) => <p>{children}</p>

export const useFormField = () => ({
  invalid: false,
  isDirty: false,
  isTouched: false,
  isValidating: false,
  error: undefined,
  id: "",
  name: "",
  formItemId: "",
  formDescriptionId: "",
  formMessageId: "",
})