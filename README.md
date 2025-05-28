# Calendar Web Application
2025 NTU Computer Network Laboratory Final Project

Group13

## Introduction

We want to implement a calendar system that support some features such as group management, poll management and permission control.

These features could help us to improve our scheduling, then raise our working productivity and efficiency.

The key components of our framework are structured as follows:
- Database: PostgreSQL
- Backend: Node.js
- Frontend: React.js
- Proxy: Nginx

For easier and safer deployment, we opted to use Docker as our main development environment.

## Services
We've successfully implemented core services, and while the major functions operate normally, some may still have minor logic or processing bugs that we'll address in future work.

### Authentication

- login / logout / register
- Session Token: JWT

### Profile

- name
- avator
- bio

### Group

- add / remove user
- group availability checking
- disband

### Calendar

- create / delete calendar
- manage event in calendar
- toggle publicity
- control r/w permission
- link to claim permission
- subscribe / unsubscribe calendar
- Integrate showcase
- baby search engine

### Poll

- invite user / group
- vote multiple time range
- vote statistics
- confirm / cancel for future usage

## Future work

### Feature

- Support import / export calendar
- Notification for coming event
- Mobile app development
- Fuzzy search engine

### Advance

- Prettier UI/UX design
- OAuth / 2FA mechanism
- Data security
- High availability
