/*
  Warnings:

  - Added the required column `phone_number` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL;
