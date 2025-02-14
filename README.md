## BlockDraw - teaching code comprehension the fun way!

![BlockDraw Demo](./public/readme-imgs/blockdraw-banner.png)

**Originally built during ICHack 2025, where it placed as a runner-up for the JetBrains challenge.**

In our work as coding tutors in a primary school, we've noticed a lot of inefficiencies in the way block coding platforms try to teach students to understand code. In particular, it's very easy for students to brute force their way through problems, running the code an infinite number of times until they get to the solution. While this trial and error approach can have its benefits, we've noticed that often it leads to students not bothering really trace through the code blocks to try to understand them. We know that tracing is really essential, but can also be really boring. So, we took what we know about our class - they love to spend 20 minutes drawing their sprites on Scratch and they love working together - and make BlockDraw: a mix of Kahoot, Scribble.io and Scratch!

## How it works
![BlockDraw Demo](./public/readme-imgs/round-banner.png)

Students join a game where they're given a snippet of Scratch code to draw. Once they submit, AI evaluates their drawings for accuracy, awarding points that appear on a live leaderboard. It’s fun, competitive, and builds genuine code comprehension.
**[A YouTube demo is available here.](https://youtu.be/yZuWo4Y7hWg)**

## How we built it
We used Next.js for the frontend, Supabase for real-time game data management, and Vercel for deployment. To evaluate the accuracy of student drawings, we used the OpenAI API, which analyzes submitted images against the expected outcome, checking if they meet specific criteria. This ensures that students are graded fairly based on how closely they followed the given Scratch code.
