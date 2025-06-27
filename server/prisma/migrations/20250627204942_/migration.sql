-- CreateTable
CREATE TABLE "_viewedUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_viewedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_viewedUsers_B_index" ON "_viewedUsers"("B");

-- AddForeignKey
ALTER TABLE "_viewedUsers" ADD CONSTRAINT "_viewedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_viewedUsers" ADD CONSTRAINT "_viewedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
