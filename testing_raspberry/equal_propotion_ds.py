import pandas as pd
from collections import Counter
import string
import random

# Input CSV
input_csv = "/Users/vipulchinmay/Documents/projectaushadX/testing_raspberry/A_Z_medicines_dataset_of_India.csv"
output_csv = "balanced_medicine_data.csv"
name_column = "name"

# Load dataset
df = pd.read_csv(input_csv)

# Ensure name column is string and drop missing
df[name_column] = df[name_column].astype(str).str.strip()
df = df[df[name_column].notna() & (df[name_column] != "")]

# Get first letter stats
df['first_letter'] = df[name_column].str.upper().str[0]
letter_counts = df['first_letter'].value_counts().sort_index()

# Print count for A–Z
print("🔤 Distribution of medicines by starting letter:")
for letter in string.ascii_uppercase:
    count = letter_counts.get(letter, 0)
    print(f"{letter}: {count}")

# Find minimum count across A–Z
min_count = min([letter_counts.get(l, 0) for l in string.ascii_uppercase if letter_counts.get(l, 0) > 0])
print(f"\n✅ Minimum count across A–Z: {min_count}")

# Create a balanced dataframe
balanced_df = pd.DataFrame()

for letter in string.ascii_uppercase:
    letter_group = df[df['first_letter'] == letter]
    if len(letter_group) >= min_count:
        sampled = letter_group.sample(min_count, random_state=42)
        balanced_df = pd.concat([balanced_df, sampled])

# Drop the helper column
balanced_df.drop(columns=['first_letter'], inplace=True)

# Save balanced dataset
balanced_df.to_csv(output_csv, index=False)
print(f"\n📁 Balanced dataset saved to: {output_csv}")
print(f"📊 Total rows in new dataset: {len(balanced_df)}")
