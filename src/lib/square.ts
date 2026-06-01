import { SquareClient, SquareEnvironment } from "square";

const isSandbox = process.env.NEXT_PUBLIC_SQUARE_APP_ID?.startsWith("sandbox-") ?? true;

export const squareClient = new SquareClient({
  token: process.env.SQUARE_SECRET_API_KEY!.trim(),
  environment: isSandbox ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
});

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!.trim();
