# IBM Reimagine <Future> Hackathon (Education)  
## NITDGP_EduCafe  

You can check out the following links:  
<a href="https://nitdgp-educafe-ibm.herokuapp.com">Hosted Website</a><br>
<a href="https://docs.google.com/presentation/d/16nXnTp1U-VMKVnR-9mE9nDsRckeaYwbL-UOfQtvgk38/edit?usp=sharing">Presentation For Ideation Round</a><br>
<a href="https://docs.google.com/presentation/d/1AHmp8T6NuvDx4vBQ6OFqK6_5CyWBUPR0pVjQkXtH8IA/edit?usp=sharing">Presentation For Prototype Round</a><br>

## Problem Statement  
Education in the post COVID world would see the technology enabled redesigning of the experience for educators and students. Schools and universities will see adoption of blended learning methodologies with an increased focus on online learning content and remote learning methodologies. Technology enabled solutions will revamp Learning Management Systems and simplify tasks like attendance tracking, designing question papers and grading/assessments. There is a need for creative ways to bridge the digital divide and make education accessible for students in rural areas too.

Propose innovative strategies such as smart ed-tech solutions powered by AI to create personalised learning experiences with focus on student engagement through immersive experiences using Virtual Reality and Gamification using IBM Cloud.


## Solution  
Website which will allow students and teachers to access to a platform from 
anywhere, and will provide them a platform where they can interact with each 
other properly and effectively. Some of the features it includes are:
- Video conferencing (with time limit).
- Take attendance records on daily basis. 
- Space for assignment submission (with time limit set as per time required).
- Poll system ( so that teacher can know what majority wants regarding particular issue).
- Notification (as per requirement).

## Solution Framework  
- Basic Assumptions:
    - Each teacher will be allocated to one subject.
    - Teachers can take classes for any year/class.
    - Students will be given choice to select multiple subjects but one year/class.
- Solution Modelling:
  - Student:
    - chedule: Students can join classes via this tab.
    - Assignments: Students can view and upload their assignments.
    - Polls: Students will be able to cast their votes to the polls.
    - Overview: Students can see their details via this tab.
  - Teacher:
    - Schedule: Teachers can create classes and record the attendance via this tab.
    - Assignments: Teachers can create and view submissions of the assignments.
    - Polls: Teachers can create polls to raise any particular issue.
    - Overview: Teachers can see their details via this tab.

## Future Scope  
- SMS Feature with premium Twilio subscription to send notifications to students in rural areas, and MMS for sending assignments.
- As of now we are using heroku servers to store the uploaded pdfs but in future we will make use of some more secure and powerful cloud storages like IBM cloud.
- Try to integrate an AI powered Chatbot which will make the platform more interactive and biddable.
- Providing user the ability to customize their dashboard according to their convenience.
- Providing Readable format of the pdfs and the documents in multi languages which will aid the illiterate people to understand the idea presented in these documents.
- Introduce **Virtual Reality** for more engaged learning!

## Team Name: EduCafe (Institute Name: National Institute of Technology, Durgapur)  
- Abantika Saha
- Akshat Bhatnagar
- Arka Seth
- Madaka Purna Sai Prasanth