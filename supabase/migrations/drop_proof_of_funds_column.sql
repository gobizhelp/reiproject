-- Drop proof_of_funds column from buy_box_submissions and buyer_buy_boxes tables
-- Run this in your Supabase SQL Editor

alter table buy_box_submissions drop column if exists proof_of_funds;
alter table buyer_buy_boxes drop column if exists proof_of_funds;
