import React, { useState } from 'react';
import { FiFileText, FiCode, FiMessageSquare, FiBook, FiBriefcase, FiTarget, FiZap, FiCopy, FiCheck, FiX, FiMinus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PromptTemplates = ({ onSelectTemplate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedTemplate, setCopiedTemplate] = useState(null);

  const templateCategories = [
    { id: 'all', name: 'All Templates', icon: FiFileText },
    { id: 'writing', name: 'Writing', icon: FiMessageSquare },
    { id: 'coding', name: 'Coding', icon: FiCode },
    { id: 'business', name: 'Business', icon: FiBriefcase },
    { id: 'education', name: 'Education', icon: FiBook },
    { id: 'creative', name: 'Creative', icon: FiTarget },
  ];

  const templates = [
    // Writing Templates
    {
      id: 'blog-post',
      title: 'Blog Post Outline',
      description: 'Create a comprehensive blog post outline with sections and key points',
      category: 'writing',
      icon: FiMessageSquare,
      template: `Create a detailed blog post outline for the topic: "{TOPIC}"

Structure the outline with:
1. Introduction (Hook, Background, Thesis)
2. Main Body (3-5 key sections with subpoints)
3. Conclusion (Summary, Call to Action)
4. SEO Keywords and Meta Description

Make it comprehensive but concise, with engaging section titles.`
    },
    {
      id: 'email-professional',
      title: 'Professional Email',
      description: 'Write a professional email for business communication',
      category: 'writing',
      icon: FiMessageSquare,
      template: `Write a professional email with the following details:

Subject: {SUBJECT}

Dear {RECIPIENT_NAME},

{EMAIL_BODY}

Best regards,
{YOUR_NAME}
{POSITION}
{COMPANY_NAME}

Key elements to include:
- Clear subject line
- Professional greeting
- Concise and organized body
- Professional closing
- Contact information`
    },
    {
      id: 'story-creative',
      title: 'Creative Story',
      description: 'Generate a creative story with plot, characters, and setting',
      category: 'creative',
      icon: FiTarget,
      template: `Write a creative short story with the following elements:

Genre: {GENRE}
Main Character: {CHARACTER_NAME}
Setting: {SETTING}
Conflict: {CONFLICT}
Theme: {THEME}

Structure the story with:
1. Introduction (Setting the scene and introducing character)
2. Rising Action (Building tension and conflict)
3. Climax (Peak of the conflict)
4. Falling Action (Resolution begins)
5. Conclusion (Resolution and theme revelation)

Keep it under 800 words and make it engaging.`
    },

    // Coding Templates
    {
      id: 'code-review',
      title: 'Code Review Checklist',
      description: 'Create a comprehensive code review checklist',
      category: 'coding',
      icon: FiCode,
      template: `Create a comprehensive code review checklist for {PROGRAMMING_LANGUAGE} code:

**Code Quality:**
- [ ] Code follows {PROGRAMMING_LANGUAGE} best practices
- [ ] Consistent naming conventions
- [ ] Proper indentation and formatting
- [ ] No unused variables or imports
- [ ] Error handling is appropriate

**Functionality:**
- [ ] Code meets requirements
- [ ] Edge cases are handled
- [ ] Input validation is present
- [ ] Performance considerations addressed

**Documentation:**
- [ ] Code is well commented
- [ ] Complex logic is explained
- [ ] Function/method documentation exists
- [ ] README is updated if needed

**Security:**
- [ ] No hardcoded secrets
- [ ] SQL injection prevention
- [ ] XSS protection measures
- [ ] Authentication/authorization checks

**Testing:**
- [ ] Unit tests exist
- [ ] Tests pass
- [ ] Code coverage is adequate`
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      description: 'Generate comprehensive API documentation',
      category: 'coding',
      icon: FiCode,
      template: `Create comprehensive API documentation for the following endpoint:

**Endpoint:** {HTTP_METHOD} {ENDPOINT_PATH}

**Description:**
{ENDPOINT_DESCRIPTION}

**Request:**
- Content-Type: {REQUEST_CONTENT_TYPE}
- Headers: {REQUEST_HEADERS}
- Body Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| {PARAM_NAME} | {PARAM_TYPE} | {REQUIRED} | {PARAM_DESCRIPTION} |

**Response:**
- Status Code: {STATUS_CODE}
- Content-Type: {RESPONSE_CONTENT_TYPE}
- Response Body:

\`\`\`json
{RESPONSE_BODY}
\`\`\`

**Example Request:**
\`\`\`{REQUEST_LANGUAGE}
{REQUEST_EXAMPLE}
\`\`\`

**Example Response:**
\`\`\`json
{RESPONSE_EXAMPLE}
\`\`\`

**Error Responses:**
- 400 Bad Request: {ERROR_DESCRIPTION}
- 401 Unauthorized: {ERROR_DESCRIPTION}
- 500 Internal Server Error: {ERROR_DESCRIPTION}`
    },

    // Business Templates
    {
      id: 'meeting-agenda',
      title: 'Meeting Agenda',
      description: 'Create a structured meeting agenda with time allocations',
      category: 'business',
      icon: FiBriefcase,
      template: `Create a meeting agenda for: {MEETING_TYPE}

**Meeting Details:**
- Date: {DATE}
- Time: {TIME}
- Location: {LOCATION}
- Duration: {DURATION}
- Attendees: {ATTENDEES}

**Agenda:**

1. **Opening (5 minutes)**
   - Welcome and introductions
   - Review meeting objectives
   - Approve previous meeting minutes

2. **Main Discussion Items (30 minutes)**
   - {TOPIC_1}: {DESCRIPTION}
   - {TOPIC_2}: {DESCRIPTION}
   - {TOPIC_3}: {DESCRIPTION}

3. **Decision Items (15 minutes)**
   - {DECISION_1}
   - {DECISION_2}
   - {DECISION_3}

4. **Action Items Review (5 minutes)**
   - Review assigned tasks
   - Set deadlines
   - Assign responsibilities

5. **Closing (5 minutes)**
   - Summarize key points
   - Next steps
   - Next meeting date

**Preparation Required:**
- {PREP_ITEM_1}
- {PREP_ITEM_2}
- {PREP_ITEM_3}

**Documents to Review:**
- {DOCUMENT_1}
- {DOCUMENT_2}`
    },
    {
      id: 'project-proposal',
      title: 'Project Proposal',
      description: 'Write a comprehensive project proposal',
      category: 'business',
      icon: FiBriefcase,
      template: `Create a comprehensive project proposal for: {PROJECT_NAME}

**Executive Summary**
{BRIEF_DESCRIPTION}

**Project Objectives**
- {OBJECTIVE_1}
- {OBJECTIVE_2}
- {OBJECTIVE_3}

**Scope of Work**
**Deliverables:**
- {DELIVERABLE_1}
- {DELIVERABLE_2}
- {DELIVERABLE_3}

**Timeline:**
- Phase 1: {DATE} - {DESCRIPTION}
- Phase 2: {DATE} - {DESCRIPTION}
- Phase 3: {DATE} - {DESCRIPTION}

**Budget:**
- Item 1: $5,000 (Design)
- Item 2: $15,000 (Development)
- Item 3: $3,000 (Testing)
- Total: $23,000

**Team:**
- Project Manager: {PM_NAME}
- Technical Lead: {TECH_LEAD}
- Team Members: {TEAM_MEMBERS}

**Success Metrics:**
- Metric 1: {MEASUREMENT}
- Metric 2: {MEASUREMENT}
- Metric 3: {MEASUREMENT}

**Risk Assessment:**
- Risk 1: {RISK_DESCRIPTION} - Mitigation: {MITIGATION}
- Risk 2: {RISK_DESCRIPTION} - Mitigation: {MITIGATION}

**Next Steps:**
- {STEP_1}
- {STEP_2}
- {STEP_3}`
    },

    // Education Templates
    {
      id: 'lesson-plan',
      title: 'Lesson Plan',
      description: 'Create a structured lesson plan for teaching',
      category: 'education',
      icon: FiBook,
      template: `Create a comprehensive lesson plan for: {SUBJECT}

**Lesson Details:**
- Grade Level: {GRADE}
- Duration: {DURATION}
- Class Size: {CLASS_SIZE}
- Date: {DATE}

**Learning Objectives:**
- Students will be able to: {OBJECTIVE_1}
- Students will understand: {OBJECTIVE_2}
- Students will demonstrate: {OBJECTIVE_3}

**Materials Needed:**
- {MATERIAL_1}
- {MATERIAL_2}
- {MATERIAL_3}

**Lesson Structure:**

1. **Introduction (10 minutes)**
   - Hook: {HOOK_ACTIVITY}
   - Review previous lesson
   - State learning objectives

2. **Direct Instruction (20 minutes)**
   - Present new concept: {CONCEPT}
   - Use examples: {EXAMPLE_1}, {EXAMPLE_2}
   - Address misconceptions

3. **Guided Practice (15 minutes)**
   - Activity: {GUIDED_ACTIVITY}
   - Teacher modeling
   - Student practice with support

4. **Independent Practice (15 minutes)**
   - Activity: {INDEPENDENT_ACTIVITY}
   - Individual work time
   - Circulate and provide feedback

5. **Assessment (10 minutes)**
   - Formative assessment: {ASSESSMENT_METHOD}
   - Check for understanding
   - Exit ticket: {EXIT_TICKET}

6. **Closure (5 minutes)**
   - Review key concepts
   - Preview next lesson
   - Homework assignment: {HOMEWORK}

**Differentiation:**
- For advanced students: {ADVANCED_ACTIVITY}
- For struggling students: {SUPPORT_ACTIVITY}
- For special needs: {ACCOMMODATION}

**Extension Activities:**
- {EXTENSION_1}
- {EXTENSION_2}`
    },

    // Creative Templates
    {
      id: 'social-media-post',
      title: 'Social Media Post',
      description: 'Create engaging social media content',
      category: 'creative',
      icon: FiTarget,
      template: `Create engaging social media content for {PLATFORM}:

**Post Type:** {POST_TYPE}
**Goal:** {GOAL}
**Target Audience:** {AUDIENCE}

**Content Strategy:**
- Hook: {ATTENTION_GRABBER}
- Value Proposition: {VALUE}
- Call to Action: {CTA}

**Visual Elements:**
- Image/Video: {MEDIA_DESCRIPTION}
- Caption Style: {CAPTION_STYLE}
- Hashtags: {HASHTAGS}
- Emojis: {EMOJIS}

**Copy:**
"{POST_COPY}"

**Engagement Tactics:**
- Question to ask: {QUESTION}
- Poll options: {POLL_OPTIONS}
- User-generated content request: {UGC_REQUEST}

**Timing:**
- Best time to post: {BEST_TIME}
- Day of week: {BEST_DAY}
- Posting frequency: {FREQUENCY}

**Tracking:**
- Metrics to watch: {METRICS}
- Success criteria: {SUCCESS_CRITERIA}`
    }
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(template => template.category === selectedCategory);

  const handleCopyTemplate = (template) => {
    navigator.clipboard.writeText(template.template).then(() => {
      setCopiedTemplate(template.id);
      toast.success('Template copied to clipboard!');
      setTimeout(() => setCopiedTemplate(null), 2000);
    });
  };

  const handleUseTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiZap className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Prompt Templates
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose from pre-built templates to get started quickly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {templateCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {template.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiFileText className="h-4 w-4" />
                    <span>Use Template</span>
                  </button>
                  <button
                    onClick={() => handleCopyTemplate(template)}
                    className={`p-2 rounded-md transition-colors ${
                      copiedTemplate === template.id
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Copy template"
                  >
                    {copiedTemplate === template.id ? (
                      <FiCheck className="h-4 w-4" />
                    ) : (
                      <FiCopy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No templates found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptTemplates;
