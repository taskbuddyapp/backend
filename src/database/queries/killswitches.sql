-- Killswitches - used to disable certain routes through the admin panel
-- Fetched every minute

CREATE TABLE IF NOT EXISTS `killswitches` (
  `id` BIGSERIAL PRIMARY KEY AUTO_INCREMENT, -- Unique ID
  `value` VARCHAR(512) NOT NULL, -- The value to match against
  `type` VARCHAR(256) NOT NULL, -- Type - can be route, ip, etc
  `description` VARCHAR(512) NOT NULL, -- Description of the killswitch
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE, -- Whether the killswitch is enabled
  `added_by` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User who added the killswitch
  `created_at` TIMESTAMP NOT NULL DEFAULT NOW(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
);