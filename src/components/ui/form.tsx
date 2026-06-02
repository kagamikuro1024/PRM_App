import * as React from "react"
import { useFormContext, Controller, FormProvider, Control, FieldValues, ControllerRenderProps, Path } from "react-hook-form"
import { cn } from "@/lib/utils"

const Form = FormProvider

interface FormFieldProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> {
  control: Control<TFieldValues>
  name: TName
  render: (props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactElement
}

function FormField<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  control,
  name,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  return <Controller control={control} name={name} render={render} />
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
))
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} {...props} />)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium text-destructive", className)}
    {...props}
  >
    {children}
  </p>
))
FormMessage.displayName = "FormMessage"

export {
  useFormContext,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}
