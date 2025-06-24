#!/bin/bash
# filepath: /Users/screechin_03/Documents/Flash_card/backend/apply_analytics_schema.sh

# This script applies the analytics schema to the flashcards_db database

echo "Applying analytics schema to flashcards_db database..."

# Use PSQL to apply the schema directly
psql -h localhost -U screechin_03 -d flashcards_db -f schema/analytics.sql

if [ $? -eq 0 ]; then
  echo "Analytics schema applied successfully!"
else
  echo "Error applying analytics schema. Please check the error messages above."
fi
