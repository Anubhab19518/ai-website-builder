"use client";

/**
 * @module ai-components/CardAdapter
 *
 * Thin adapter around /components/ui/card.
 *
 * Exposes a flat, AI-friendly interface (title, description, children, footer)
 * that maps onto the platform Card compound components without duplicating them.
 */

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CardAdapterProps } from "./types";

/**
 * CardAdapter
 *
 * Renders a platform Card from a simple flat prop set.
 * `children` is rendered inside CardContent for arbitrary rich content.
 */
export const CardAdapter = ({
  title,
  description,
  children,
  size = "default",
  footer,
}: CardAdapterProps) => {
  return (
    <Card size={size}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      {children && <CardContent>{children}</CardContent>}

      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export default CardAdapter;
