/*
  Warnings:

  - You are about to drop the column `birthday` on the `Testimoni` table. All the data in the column will be lost.
  - Added the required column `jabatan` to the `Testimoni` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Testimoni" DROP COLUMN "birthday",
ADD COLUMN     "jabatan" TEXT NOT NULL;
