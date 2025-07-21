# Invite Collaboration Feature Setup

This document explains how to set up and use the new invite collaboration feature in your to-do list application.

## Backend Setup

### 1. Update Database

The new invite functionality requires a new `Invite` table in the database. Run the following command to recreate the database with all tables:

```bash
cd Backend
python setup_database.py
```

This will create the database with the following new table:

- `Invite` - Stores team invitations with email, team_id, status, and timestamps

### 2. New API Endpoints

The following new endpoints have been added to `/teams/`:

- `POST /teams/invite/` - Send an invitation to a user
- `GET /teams/invites/pending` - Get pending invitations for the current user
- `POST /teams/invites/{invite_id}/accept` - Accept an invitation
- `POST /teams/invites/{invite_id}/decline` - Decline an invitation

## Frontend Features

### 1. User Management Page

- **Access**: Available to all users via the "User Management" tab
- **Features**:
  - View your profile information
  - Send invitations to other users (if you're part of a team)
  - View and respond to pending invitations

### 2. Quick Invite Button

- **Location**: In the To-Do Lists page, next to the "Add List" button
- **Functionality**: Quick modal to invite collaborators to your team
- **Visibility**: Only shows if you're part of a team

### 3. Admin Page

- **Access**: Available to admin users via the "Admin Page" tab
- **Features**: Full user management (create, edit, delete users)

## How to Use

### Sending Invitations

1. **From User Management Page**:

   - Go to "User Management" tab
   - Enter an email address in the "Invite Users to Your Team" section
   - Click "Send Invite"

2. **From To-Do Lists Page**:
   - Click the "Invite Collaborators" button (green button)
   - Enter the email address in the modal
   - Click "Send Invitation"

### Accepting Invitations

1. Go to "User Management" tab
2. In the "Pending Invitations" section, you'll see any invitations sent to your email
3. Click "Accept" to join the team or "Decline" to reject the invitation

### Team Collaboration

- Once users are part of the same team, they can:
  - See and edit the same to-do lists
  - Add tasks to shared lists
  - Collaborate on team projects

## Security Features

- Users can only invite others to their own team
- Invitations are tied to specific email addresses
- Users can only accept invitations sent to their email
- Duplicate invitations are prevented
- Users cannot invite someone who's already in the team

## Database Schema

### Invite Table

```sql
CREATE TABLE invite (
    id INTEGER PRIMARY KEY,
    email VARCHAR NOT NULL,
    team_id INTEGER NOT NULL,
    invited_by INTEGER NOT NULL,
    status VARCHAR DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES team (id),
    FOREIGN KEY (invited_by) REFERENCES user (id)
);
```

## Troubleshooting

### Common Issues

1. **"You need to be part of a team" error**:

   - Make sure you have a `team_id` assigned to your user account
   - Ask an admin to assign you to a team or create a new team

2. **"Invitation already sent" error**:

   - The user already has a pending invitation for this team
   - Wait for them to accept/decline the existing invitation

3. **"User is already a member" error**:
   - The user is already part of the team
   - No need to send another invitation

### Database Issues

If you encounter database errors:

1. Delete the `todo.db` file
2. Run `python setup_database.py` again
3. Restart the backend server

## Future Enhancements

- Email notifications for invitations
- Invitation expiration dates
- Team role management (admin, member, etc.)
- Bulk invitation features
