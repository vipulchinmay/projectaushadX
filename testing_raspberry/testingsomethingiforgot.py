import csv

# Input CSV file path
csv_file_path = r'/Users/vipulchinmay/Documents/projectaushadX/testing_raspberry/balanced_medicine_data.csv'
output_txt_path = 'med_words.txt'

# Set to avoid duplicates
unique_terms = set()

with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row.get('name', '').strip()
        comp1 = row.get('short_composition1', '').strip()
        comp2 = row.get('short_composition2', '').strip()

        # Add each non-empty term to the set
        if name:
            unique_terms.add(name)
        if comp1:
            unique_terms.add(comp1)
        if comp2:
            unique_terms.add(comp2)

# Write terms to txt file, one per line, sorted alphabetically
with open(output_txt_path, mode='w', encoding='utf-8') as txtfile:
    for term in sorted(unique_terms):
        txtfile.write(f"{term}\n")

print(f"✅ Extracted {len(unique_terms)} unique terms (name + compositions) to {output_txt_path}")