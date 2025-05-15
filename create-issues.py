import csv
import requests

# === CONFIGURATION ===
GITHUB_TOKEN = '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'
REPO_OWNER = 'n0access'
REPO_NAME = 'POS'
PROJECT_NUMBER = None  # Optional: If you want to add to a specific project
HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github+json'
}

# === INPUT CSV FORMAT ===
# title,body,labels,column
CSV_FILE = 'issues.csv'


def create_issue(title, body='', labels=None):
    url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues'
    data = {
        'title': title,
        'body': body,
        'labels': labels or []
    }
    response = requests.post(url, json=data, headers=HEADERS)
    if response.status_code == 201:
        print(f"Created issue: {title}")
        return response.json()
    else:
        print(f"Failed to create issue: {title}\n{response.text}")
        return None


def read_issues_from_csv(csv_file):
    with open(csv_file, newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            title = row['title']
            body = row.get('body', '')
            labels = row.get('labels', '').split(',') if row.get('labels') else []
            create_issue(title.strip(), body.strip(), [label.strip() for label in labels])


if __name__ == '__main__':
    read_issues_from_csv(CSV_FILE)
