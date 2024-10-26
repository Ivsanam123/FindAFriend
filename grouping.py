import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.cluster import AgglomerativeClustering
from collections import Counter
import random
import string
from datetime import datetime
import pymongo
from apscheduler.schedulers.background import BackgroundScheduler

def generate_group_name():
    adjectives = ['Happy', 'Bright', 'Swift', 'Clever', 'Dynamic', 'Brave', 'Wise']
    nouns = ['Eagles', 'Lions', 'Dragons', 'Phoenix', 'Tigers', 'Hawks', 'Bears']
    return f"{random.choice(adjectives)}{random.choice(nouns)}"

def calculate_euclidean_distance(df, columns):
    distance_matrix = euclidean_distances(df[columns])
    similarity_matrix = 1 / (1 + distance_matrix)
    return pd.DataFrame(similarity_matrix, index=df.index, columns=df.index)

def adjust_group_sizes(df, min_size=4, max_size=6):
    group_sizes = Counter(df['cluster'])
    small_groups = [group for group, size in group_sizes.items() if size < min_size]
    large_groups = [group for group, size in group_sizes.items() if size > max_size]

    for group in large_groups:
        while group_sizes[group] > max_size:
            individual_index = random.choice(df[df['cluster'] == group].index.tolist())
            if small_groups:
                new_group = random.choice(small_groups)
                df.at[individual_index, 'cluster'] = new_group
                group_sizes[group] -= 1
                group_sizes[new_group] += 1

    return df

def calculate_group_similarity(previous_groups, current_groups):
    if not previous_groups:
        return 0
    
    similarities = []
    for prev_group in previous_groups:
        for curr_group in current_groups:
            common = len(set(prev_group) & set(curr_group))
            total = len(set(prev_group) | set(curr_group))
            similarity = common / total if total > 0 else 0
            similarities.append(similarity)
    
    return max(similarities)

def create_groups():
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['questionnaire']
    
    # Get all questionnaire responses
    responses = list(db.questionnaires.find())
    if not responses:
        return
    
    # Convert responses to DataFrame
    data = []
    for response in responses:
        row = {
            'email': response['email'],
            'name': response['answers']['name'],
            'department': response['answers']['department'],
            'year': response['answers']['year'],
            'interests': response['answers']['interests'],
            'about': response['answers']['about']
        }
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # One-hot encode interests
    interests_dummies = df['interests'].apply(pd.Series).stack().str.get_dummies().sum(level=0)
    df = pd.concat([df, interests_dummies], axis=1)
    
    # Prepare clustering data
    clustering_cols = interests_dummies.columns.tolist()
    clustering_data = df[clustering_cols]
    
    # Calculate number of groups
    num_people = len(df)
    num_groups = max(1, num_people // 5)  # Average group size of 5
    
    # Perform clustering
    agg_cluster = AgglomerativeClustering(n_clusters=num_groups)
    df['cluster'] = agg_cluster.fit_predict(clustering_data)
    
    # Adjust group sizes
    df = adjust_group_sizes(df)
    
    # Get previous groups
    previous_groups = list(db.groups.find({'active': True}))
    previous_group_members = [group['members'] for group in previous_groups]
    
    # Create new groups
    new_groups = []
    for cluster in df['cluster'].unique():
        cluster_members = df[df['cluster'] == cluster][['email', 'name']].to_dict('records')
        group = {
            'name': generate_group_name(),
            'members': cluster_members,
            'created_at': datetime.now(),
            'active': True
        }
        new_groups.append(group)
    
    # Calculate similarity with previous groups
    similarity = calculate_group_similarity(
        [[m['email'] for m in group['members']] for group in previous_groups] if previous_groups else [],
        [[m['email'] for m in group['members']] for group in new_groups]
    )
    
    # Only update groups if similarity is less than 50%
    if similarity < 0.5:
        # Deactivate old groups
        if previous_groups:
            db.groups.update_many(
                {'active': True},
                {'$set': {'active': False}}
            )
        
        # Insert new groups
        db.groups.insert_many(new_groups)
        return True
    
    return False

def schedule_grouping():
    scheduler = BackgroundScheduler()
    scheduler.add_job(create_groups, 'cron', hour=12, minute=0)
    scheduler.start()

if __name__ == '__main__':
    schedule_grouping()