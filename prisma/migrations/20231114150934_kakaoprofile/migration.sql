/*
  Warnings:

  - You are about to drop the column `connectedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "connectedAt";

-- AlterTable
ALTER TABLE "kakaoProfile" ADD COLUMN     "connectedAt" TEXT;
