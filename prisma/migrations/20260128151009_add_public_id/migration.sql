/*
  Warnings:

  - Made the column `publicId` on table `GalleryImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GalleryImage" ALTER COLUMN "publicId" SET NOT NULL;
