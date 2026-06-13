-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "receiptPaperWidthMm" INTEGER;
ALTER TABLE "Settings" ADD COLUMN "receiptPrintableWidthMm" INTEGER;

UPDATE "Settings" SET "receiptPaperWidthMm" = 58, "receiptPrintableWidthMm" = 54 WHERE "receiptSize" = '58mm';
UPDATE "Settings" SET "receiptPaperWidthMm" = 80, "receiptPrintableWidthMm" = 76 WHERE "receiptSize" = '80mm' OR "receiptSize" IS NULL;
UPDATE "Settings" SET "receiptPaperWidthMm" = 89, "receiptPrintableWidthMm" = 85 WHERE "receiptSize" = '89mm';
