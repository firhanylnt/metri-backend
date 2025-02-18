/*
  Warnings:

  - You are about to drop the column `jabatan` on the `Testimoni` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `User` table. All the data in the column will be lost.
  - Added the required column `departemen` to the `Testimoni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthdate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Testimoni" DROP COLUMN "jabatan",
ADD COLUMN     "departemen" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthday",
ADD COLUMN     "birthdate" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL;
