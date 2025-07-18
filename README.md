Sure! Here's your project description rewritten in **Markdown** using the formatting tips you shared:

---

## 🧠 IntelCraft: Your AI Outreach Agent

### 🚀 What is IntelCraft?

**IntelCraft** is your AI-powered research buddy, built to help **students, freshers, and job seekers** learn about companies quickly and write personalized emails — whether you're applying for an internship, job, or preparing for an interview.

Instead of spending hours Googling and drafting cover letters, you get everything done in *minutes* — thanks to real-time web scraping, smart AI summarization, and insightful reporting.

---

### 🎯 Why We Built This

As students ourselves, we found it frustrating and time-consuming to:

* Understand a company’s background and goals
* Write compelling emails or cover letters
* Prepare for interviews with real insights
* Handle last-minute applications

Most existing tools are made for professionals — not freshers or students.

So, we built **IntelCraft** to:

* Provide instant, accurate **company insights**
* Save hours of **manual research**
* Generate **custom emails** and outreach drafts
* Make job prep feel more *strategic* and less *stressful*

---

### 🔧 How It Works

1. **Search for a Company**
   Enter a company name — we collect data from reliable online sources.

2. **AI Breaks it Down**
   Our AI summarizes:

   * Company mission & values
   * Latest news & achievements
   * Competitors
   * Opportunities & trends

3. **Get a Personalized Email**
   Based on your interest + the company’s insights, we auto-generate a thoughtful email or cover letter.

---

### 👨‍💻 Technologies We Used

* **Frontend**: React + TypeScript
* **Backend**: FastAPI + PostgreSQL
* **Auth**: Google OAuth
* **AI Models**: OpenAI, Gemini, Tavily
* **Real-Time Updates**: WebSockets
* **Agent Flow**: LangGraph for managing AI steps

---

### 💡 What We Learned

* Debugging OAuth callback issues across local and deployed environments
* Optimizing AI responses with fallback logic
* Maintaining state and live updates through WebSockets
* Choosing the right AI provider for different use-cases

---

### 🛠️ Code Highlights

```python
# Our AI Pipeline:
class ResearchPipeline:
    def __init__(self):
        self.collector = WebDataCollector()
        self.analyzer = AIAnalyzer()
        self.synthesizer = ReportGenerator()

    async def process_company(self, company_name: str):
        raw_data = await self.collector.gather(company_name)
        insights = await self.analyzer.process(raw_data)
        report = await self.synthesizer.create(insights)
        return report
```

```typescript
// WebSocket gives live updates while processing:
const ws = new WebSocket(`${WS_BASE_URL}/ws/${jobId}`);
ws.onmessage = (event) => updateResearchStatus(JSON.parse(event.data));
```

---

### 🧑‍🎓 Who This Is For

* Students preparing for interviews
* Freshers applying to companies
* Anyone needing help with email drafts
* People curious about company background

> *“Hi \[Company], I admire your recent work on \[X]. I'd love to contribute...”*
> — This is generated instantly for you.

---

### 🌟 Features

* ✅ Google Sign-In
* ✅ Company insight dashboard
* ✅ Personalized email/cover letter generation
* ✅ Real-time progress updates
* ✅ Clean & mobile-friendly interface

---

### 📊 What We Achieved

* ⏱️ Cut research time by **90%**
* 📩 Auto-generated professional outreach messages
* 🔄 Real-time research feedback loop
* 🚀 Full-stack deployment with:

  * Frontend: [Vercel](https://vercel.com)
  * Backend: [Render](https://render.com)

---

### 🔮 What's Next

* Resume parsing + matching company profile
* Comparison dashboard
* More AI models for diversity
* Export to PDF / Excel

---

### 🎓 Final Thoughts

**IntelCraft** started at a hackathon — now it's solving real problems.

If you're a student, fresher, or job seeker who struggles with company research or writing emails, *we built this for you*.

