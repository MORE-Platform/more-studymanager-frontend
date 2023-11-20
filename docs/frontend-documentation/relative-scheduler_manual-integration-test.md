# Manual integration Test for Relative Scheduler Feature

## Feature: Realtive Scheduler in SMF

Background: Study was created or exists.

| **Scenario**                  | **Given**                                                                                   | **Steps**                                                                                                                                                                                                                                                                              |**Expected Result** | **Result** |
|-------------------------------|---------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|-----------|
| Open relative schedule dialog | <ul><li>Observation Dialog is open</li></ul>                       | **Set schedule** <ul><li>WHEN I click on the button 'Add relative Schedule', </li><li>AND Set starts on to Date: Day 2 and Time: 09:00</li><li>Set ends on to Date: 5 and Time: 18:00</li><li>Click save for the relative Schedule</li></ul> |THEN the 'Manage relative schedule' opens.||
| Set start and end of realtive schedule|<ul><li>Manage relative schedule dialog is open.</li></ul>|WHEN I set 'Starts on' to Day 2 and 'Time' to||
