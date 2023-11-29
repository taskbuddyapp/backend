CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY, -- ID of post
    uuid VARCHAR(255) NOT NULL, -- UUID of post
    user_id BIGSERIAL NOT NULL, -- User who posted
    title VARCHAR(255) NOT NULL, -- Title of job
    title_vector vector NOT NULL, -- Vector representation of title for similarity search
    description TEXT NOT NULL, -- Description of job
    media TEXT[] NOT NULL, -- Array of media URLs (images, videos, etc.) -- TODO: Add support for videos
    job_type INTEGER NOT NULL, -- 0 - one-time, 1 - part-time, 2 - full-time
    remote BOOLEAN NOT NULL DEFAULT FALSE, -- Is the job remote?
    lat FLOAT, -- Location of post
    lng FLOAT, -- Location of post
    price FLOAT NOT NULL, -- Price of job
    suggestion_radius FLOAT, -- Radius of suggestion
    likes BIGINT NOT NULL DEFAULT 0, -- Number of likes
    comments BIGINT NOT NULL DEFAULT 0, -- Number of comments
    shares BIGINT NOT NULL DEFAULT 0, -- Number of times post has been shared
    bookmarks BIGINT NOT NULL DEFAULT 0, -- Number of times post has been bookmarked
    impressions BIGINT NOT NULL DEFAULT 0, -- Number of times post has been seen
    location_name TEXT, -- Name of location, if applicable
    removed BOOLEAN NOT NULL DEFAULT FALSE, -- Removed by admin
    removal_reason TEXT, -- Reason for removal, set by admin
    flagged BOOLEAN NOT NULL DEFAULT FALSE, -- Flagged for review by algorithm
    flagged_reason TEXT, -- Reason for flagging (sexual, violent, etc.)
    shadow_banned BOOLEAN NOT NULL DEFAULT FALSE, -- Doesn't show up in feed, but still exists, user doesn't know
    start_date TIMESTAMP NOT NULL, -- Start date of job
    end_date TIMESTAMP NOT NULL, -- End date of job
    reserved BOOLEAN NOT NULL DEFAULT FALSE, -- Reserved for a user
    reserved_by BIGSERIAL, -- User who reserved the post
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reserved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS post_tag_relationship ( -- Many to many relationship
    post_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES post_tags(tag_id)
);

CREATE TABLE IF NOT EXISTS view_history ( -- Scrolling history for user
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
