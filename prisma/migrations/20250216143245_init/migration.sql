-- CreateTable
CREATE TABLE "ExistingUser" (
    "id" SERIAL NOT NULL,
    "npk" INTEGER NOT NULL,
    "fullname" TEXT NOT NULL,
    "cabang" TEXT NOT NULL,
    "departemen" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "doorprize" TEXT NOT NULL,

    CONSTRAINT "ExistingUser_pkey" PRIMARY KEY ("id")
);
