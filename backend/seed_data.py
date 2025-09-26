"""
Seed data script for Prompt Library
Run this script to populate the database with sample data
Usage: python manage.py shell < seed_data.py
"""

import os
import django
import json
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prompt_library.settings')
django.setup()

from django.contrib.auth.models import User
from prompts.models import Category, Prompt

def create_sample_data():
    """Create sample categories and prompts"""

    # Create admin user if not exists
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@promptlibrary.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.username}")

    # Create regular user
    regular_user, created = User.objects.get_or_create(
        username='user',
        defaults={
            'email': 'user@promptlibrary.com',
            'first_name': 'John',
            'last_name': 'Doe'
        }
    )
    if created:
        regular_user.set_password('user123')
        regular_user.save()
        print(f"Created regular user: {regular_user.username}")

    # Sample categories
    categories_data = [
        {
            'name': 'Writing',
            'description': 'Prompts for creative writing, copywriting, and content creation'
        },
        {
            'name': 'Programming',
            'description': 'Coding prompts, debugging help, and development assistance'
        },
        {
            'name': 'Business',
            'description': 'Business analysis, strategy, and professional communication'
        },
        {
            'name': 'Education',
            'description': 'Teaching, learning, and educational content creation'
        },
        {
            'name': 'Creative',
            'description': 'Art, design, music, and other creative endeavors'
        }
    ]

    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Created category: {category.name}")
        categories[cat_data['name']] = category

    # Sample prompts
    prompts_data = [
        # Writing prompts
        {
            'title': 'Email Marketing Copy',
            'description': 'Write compelling email subject lines and body copy for a product launch',
            'content': '''Create 5 different email subject lines for a new productivity app launch:
1. Subject line that creates urgency
2. Subject line that highlights a benefit
3. Subject line that asks a question
4. Subject line that uses social proof
5. Subject line that creates curiosity

Then write the email body copy that:
- Introduces the product and its main benefit
- Addresses the target audience's pain points
- Includes social proof or testimonials
- Has a clear call-to-action
- Uses engaging, conversational language''',
            'category': categories['Writing'],
            'tags': ['email', 'marketing', 'copywriting', 'product-launch'],
            'is_favorite': True
        },
        {
            'title': 'Blog Post Outline',
            'description': 'Create a comprehensive blog post outline for a given topic',
            'content': '''Create a detailed blog post outline for the topic: "{topic}"

Structure the outline with:
1. Introduction (hook, problem statement, thesis)
2. Main Body (3-5 key points with subpoints)
3. Supporting Evidence (statistics, examples, case studies)
4. Counterarguments and Rebuttals
5. Conclusion (summary, call-to-action, final thoughts)
6. SEO keywords to include
7. Recommended word count for each section

Make it comprehensive but not overwhelming, suitable for a 1500-2000 word blog post.''',
            'category': categories['Writing'],
            'tags': ['blog', 'content', 'outline', 'seo'],
            'is_favorite': False
        },

        # Programming prompts
        {
            'title': 'Code Review Checklist',
            'description': 'Generate a comprehensive code review checklist for different types of projects',
            'content': '''Create a code review checklist for {project_type} development:

General Code Quality:
- [ ] Code follows project style guidelines
- [ ] Proper error handling implemented
- [ ] Input validation is present
- [ ] Comments explain complex logic
- [ ] No hardcoded values or magic numbers

Security Considerations:
- [ ] SQL injection protection
- [ ] XSS vulnerability checks
- [ ] Authentication/authorization implemented
- [ ] Sensitive data encrypted

Performance:
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate
- [ ] Memory leaks checked
- [ ] Algorithm efficiency considered

Testing:
- [ ] Unit tests written
- [ ] Integration tests included
- [ ] Edge cases covered
- [ ] Test coverage meets requirements''',
            'category': categories['Programming'],
            'tags': ['code-review', 'quality', 'checklist', 'development'],
            'is_favorite': True
        },
        {
            'title': 'API Documentation Template',
            'description': 'Create comprehensive API documentation for REST endpoints',
            'content': '''Document the following API endpoint:

Endpoint: {method} {path}
Description: {description}

Request Format:
- Headers: Content-Type, Authorization, etc.
- Parameters: Query parameters, path parameters
- Request Body: JSON schema or example

Response Format:
- Success Response (200, 201, etc.)
- Error Responses (400, 401, 403, 404, 500)
- Response Body: JSON schema or example

Authentication: Required/Permission levels
Rate Limiting: Requests per minute/hour
Examples: curl commands and response examples
Notes: Additional considerations, deprecation warnings''',
            'category': categories['Programming'],
            'tags': ['api', 'documentation', 'rest', 'backend'],
            'is_favorite': False
        },

        # Business prompts
        {
            'title': 'Market Research Framework',
            'description': 'Create a comprehensive market research framework for product analysis',
            'content': '''Conduct market research for {product_category}:

1. Market Size Analysis:
   - Total addressable market (TAM)
   - Serviceable available market (SAM)
   - Serviceable obtainable market (SOM)
   - Market growth rate and trends

2. Competitive Analysis:
   - Direct competitors and their market share
   - Indirect competitors and substitutes
   - Competitive advantages/disadvantages
   - Pricing strategies of competitors

3. Customer Analysis:
   - Target customer demographics
   - Customer pain points and needs
   - Buying behavior and preferences
   - Customer acquisition channels

4. SWOT Analysis:
   - Strengths (internal advantages)
   - Weaknesses (internal limitations)
   - Opportunities (external factors)
   - Threats (external risks)

5. Recommendations:
   - Market entry strategy
   - Pricing recommendations
   - Marketing approach
   - Risk mitigation strategies''',
            'category': categories['Business'],
            'tags': ['market-research', 'analysis', 'strategy', 'business'],
            'is_favorite': True
        },

        # Education prompts
        {
            'title': 'Lesson Plan Template',
            'description': 'Create a detailed lesson plan for any subject and grade level',
            'content': '''Create a lesson plan for:

Subject: {subject}
Grade Level: {grade}
Topic: {topic}
Duration: {duration} minutes

Lesson Objectives:
- Learning objectives (3-5 measurable outcomes)
- Success criteria for students
- Alignment with curriculum standards

Materials Needed:
- Resources, tools, technology required
- Preparation instructions for materials

Lesson Structure:
1. Introduction/Hook (5-10 minutes)
   - Attention-grabbing activity
   - Connection to prior learning
   - Introduction of new concepts

2. Direct Instruction (10-15 minutes)
   - Key concepts and vocabulary
   - Step-by-step explanations
   - Visual aids and examples

3. Guided Practice (15-20 minutes)
   - Teacher-led activities
   - Small group work
   - Formative assessment opportunities

4. Independent Practice (15-20 minutes)
   - Individual or pair work
   - Application of concepts
   - Differentiation strategies

5. Assessment/Evaluation (5-10 minutes)
   - Formative assessment methods
   - Exit ticket or quick check
   - Homework assignments

6. Closure (5 minutes)
   - Review of key concepts
   - Connection to future learning
   - Student reflection

Differentiation:
- Strategies for advanced learners
- Support for struggling students
- Accommodations for special needs

Extensions:
- Enrichment activities
- Cross-curricular connections
- Real-world applications''',
            'category': categories['Education'],
            'tags': ['lesson-plan', 'education', 'teaching', 'curriculum'],
            'is_favorite': False
        },

        # Creative prompts
        {
            'title': 'Story Character Development',
            'description': 'Develop complex, realistic characters for stories',
            'content': '''Develop a character profile for a {genre} story:

Character Name: {character_name}
Role in Story: {role}

Basic Information:
- Age, gender, ethnicity, occupation
- Physical appearance and distinctive features
- Personality traits (positive and negative)
- Background and family history

Psychological Profile:
- Motivations and goals
- Fears and insecurities
- Values and beliefs
- Internal conflicts

Relationships:
- Family relationships and dynamics
- Friendships and romantic interests
- Professional relationships
- Antagonists or rivals

Character Arc:
- Starting point (flaws to overcome)
- Inciting incident that drives change
- Growth and transformation
- Resolution and final state

Dialogue Style:
- Speech patterns and vocabulary
- Common phrases or expressions
- Tone and manner of speaking
- Non-verbal communication cues

Symbolic Elements:
- Objects or items associated with character
- Colors, animals, or motifs that represent them
- Character's role in theme or metaphor

Backstory Events:
- Key life events that shaped personality
- Traumatic experiences or triumphs
- Secrets or hidden aspects
- Future aspirations or fears''',
            'category': categories['Creative'],
            'tags': ['character', 'story', 'writing', 'creative'],
            'is_favorite': True
        }
    ]

    # Create prompts
    for prompt_data in prompts_data:
        prompt, created = Prompt.objects.get_or_create(
            title=prompt_data['title'],
            defaults={
                'description': prompt_data['description'],
                'content': prompt_data['content'],
                'category': prompt_data['category'],
                'tags': prompt_data['tags'],
                'author': regular_user,
                'is_favorite': prompt_data['is_favorite'],
                'usage_count': 0,
            }
        )
        if created:
            print(f"Created prompt: {prompt.title}")

    print("\nSeed data creation completed!")
    print(f"Total categories created: {len(categories)}")
    print(f"Total prompts created: {len(prompts_data)}")
    print(f"Users: admin/admin123, user/user123")

if __name__ == '__main__':
    create_sample_data()
