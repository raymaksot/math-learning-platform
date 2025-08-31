import React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
        className
      )}
      {...props}
    />
  );
};

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={cn(
        "p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
};

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <h3
      className={cn("text-lg font-semibold leading-6", className)}
      {...props}
    />
  );
};

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = ({
  className,
  ...props
}: CardDescriptionProps) => {
  return (
    <p
      className={cn("mt-1 text-sm text-gray-500", className)}
      {...props}
    />
  );
};

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = ({ className, ...props }: CardContentProps) => {
  return <div className={cn("p-4 sm:p-6", className)} {...props} />;
};

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = ({ className, ...props }: CardFooterProps) => {
  return (
    <div
      className={cn(
        "p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
};

export default Card;
