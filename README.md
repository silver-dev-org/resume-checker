# Silver.dev's Resume Checker

Resume Checker is a web-based application that uses AI to analyze resumes, provide feedback, and grade them following [silver.dev](https://silver.dev)'s [CV Checklist](https://docs.silver.dev/interview-ready/soft-fundamentals/preparando-el-cv#cv-checklist). With a simple and user-friendly interface, users can upload their resumes and receive actionable suggestions for improvement, helping them enhance their chances in the job market.

## Features

- **AI-Driven Feedback**: Provides detailed insights and suggestions to improve resumes.
- **Drag-and-Drop Upload**: Simple and intuitive file upload process.
- **Grading**: Generates a score based on the resume's structure, content, and clarity.

## Technologies Used

- **Frontend**: [React](https://reactjs.org/) with [Next.js](https://nextjs.org/) pages router.
- **Backend**: Next.js API routes
- **AI Integration**: Gemini (via Vercel's ai-sdk)
- **PDF Parsing**: [pdf-parse](https://www.npmjs.com/package/pdf-parse) (mainly used to get metadata out of the pdf)

## Getting Started

Follow these steps to run Resume Checker locally:

### Prerequisites

Ensure you have the following installed:

- Node.js (v18+ recommended)
- npm
- [GOOGLE_GENERATIVE_AI_API_KEY key](https://ai.google.dev/gemini-api/docs/api-key)

### Installation

1. Clone the repository:

  ```bash
  git clone https://github.com/conanbatt/resume-checker.git
  cd resume-checker
  ```

1. Install dependencies:

  ```bash
  npm install
  ```

1. Create a `.env` file

  ```bash
  GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-key>
  ```

1. Start the dev server

  ```bash
  npm run dev
  ```

## Usage

1. Drag and drop or upload your resume file (PDF format) into the upload area.
1. Wait for the analysis to complete.
1. Review the grade and suggestions provided by the AI.

## Contributions

Contributions are welcome! Feel free to fork the repository and submit a pull request with your improvements.
For more on [how to contribute](https://opensource.guide/how-to-contribute/)
