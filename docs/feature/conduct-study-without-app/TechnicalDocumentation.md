# <span style="color: #6E8FAC">Technical Documentation: Conduct a MORE Study without the App</span>

## <span style="color: #6E8FAC">Overview</span>
MORE supports a study mode in which the mobile app is not required. In this mode, participants complete questionnaires via the Participant Portal web application instead of using the MORE mobile app.

Currently, this mode supports LimeSurvey observations only, but the architecture allows extension to additional observation types in the future.

---

## <span style="color: #6E8FAC">System Architecture</span>

In LimeSurvey-only studies, the MORE mobile application is replaced by the Participant Portal as the participant-facing client.

### <span style="color: #6E8FAC">The Participant Portal</span>
- authenticates participants using a generated login URL and code
- retrieves observation metadata via the Gateway
- displays active LimeSurvey observations
- redirects participants to LimeSurvey questionnaires when schedules are active

Survey availability depends on observation schedule activation.

### <span style="color: #6E8FAC">Study Manager Architecture and Extension</span>

#### <span style="color: #6E8FAC">Study Configuration Extension (StudyManager)</span>

Participant Portal access is enabled via an extension of the study configuration schema.

```yaml
# StudyManagerAPI.yaml - Study Schema extension
applicationAccess:
  type: array
  description: Application types which the user has access to
  items:
    type: string
```

The `applicationAccess` field defines which applications participants can use besides the MORE mobile app.

Currently supported value:
- `participantPortal`

  If present, participants can authenticate via the Participant Portal.

#### <span style="color: #6E8FAC">Participant Portal Access Mechanism</span>
After activating the Participant Portal functionality, access credentials are generated per participant within the StudyManager.

The backend generates:
##### 1. Participant Portal URL
The backend generates a portal URL containing a study reference and a participant-specific identifier. A UUID-based mapping table links the external portal identifier to internal entities such as:
- `participantId`
- `observationId`
- `scheduleId`

This prevents exposure of internal identifiers.

##### 2. Participant Portal Login Code:
A reusable login code is generated together with the URL (similar to the mobile app login token) and validated by the Gateway during authentication on the Participant Portal.

##### 3. Access Roles
Credential generation is available to users with the roles:
- Study Administrator
- Study Operator

The Participant Portal communicates directly with the MORE Gateway, which performs authentication during portal login.

#### <span style="color: #6E8FAC">Credential Generation Flow</span>

Credential generation is triggered from the StudyManager participant list UI.

Generated credentials include:

| Component  | Purpose                         |
| ---------- | ------------------------------- |
| Portal URL | Identifies portal entry context |
| Login code | Authenticates participant       |

The generated URL remains stable even if observation configurations change.

#### <span style="color: #6E8FAC">Observation Linkage Logic</span>
This is the same as before (see also [more-limesurvey repository](https://github.com/MORE-Platform/more-limesurvey):

LimeSurvey observations must be explicitly linked to LimeSurvey survey IDs.

**During observation creation:**
1. A LimeSurvey observation type is selected
2. The survey ID is provided
3. The observation schedule is configured

Observation availability in the Participant Portal depends on schedule activation.

Only active observations expose redirect links.

Further configuration details are available in the MORE LimeSurvey repository:
https://github.com/MORE-Platform/more-limesurvey

#### <span style="color: #6E8FAC">LimeSurvey Integration</span>
LimeSurvey questionnaires are accessed via redirect links generated dynamically by the backend. It is the same process that is also used for the More App. However the final links are put together by the Participant Portal itself.

**Redirect links:**
- are schedule-bound
- are generated per observation instance
- are validated by the Gateway before forwarding

### <span style="color: #6E8FAC">Participant Portal Architecture</span>
The Participant Portal is a standalone web client responsible for:
- participant authentication via login code
- consent state handling
-. observation retrieval via Gateway
- LimeSurvey redirect initiation

Repository: https://github.com/MORE-Platform/more-participant-portal

The portal currently supports LimeSurvey observations only but is designed for extensibility toward additional observation types.

#### <span style="color: #6E8FAC">Tech Stack Used</span>
| Tool              | Purpose                      |
| ----------------- | ---------------------------- |
| Vue 3             | UI framework                 |
| Vite              | Build tooling                |
| TypeScript        | Static typing                |
| Vue Router        | Client-side routing          |
| Pinia             | Client-side state management |
| TanStack Query    | Server state synchronization |
| TailwindCSS       | Utility-based styling        |
| PrimeVue          | Component library            |
| OpenAPI Generator | Typed API client generation  |
