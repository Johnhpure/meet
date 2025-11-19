-- CreateTable
CREATE TABLE `registrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `idCard` VARCHAR(18) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `hasPlusOnes` BOOLEAN NOT NULL DEFAULT false,
    `plusOnesCount` INTEGER NOT NULL DEFAULT 0,
    `attendanceType` VARCHAR(20) NOT NULL,
    `companions` TEXT NULL,
    `phone` VARCHAR(11) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `wechat` VARCHAR(50) NULL,
    `city` VARCHAR(50) NOT NULL,
    `position` VARCHAR(50) NOT NULL,
    `permitImageUrl` VARCHAR(255) NOT NULL,
    `paymentImageUrl` VARCHAR(255) NOT NULL,
    `totalFee` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `registrations_idCard_key`(`idCard`),
    INDEX `registrations_phone_idx`(`phone`),
    INDEX `registrations_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
