# TODO

<h2>Sensors</h2>
(TBH, you won't need any of this right now. But it can beome other challenges have stuff like it.)
<table>
  <thead>
    <td>Key</td>
    <td>Type</td>
    <td>Description</td>
  </thead>
  <tr>
    <td>prevSpeedWanted / prevTurnWanted / prevSidleWanted</td>
    <td>Number</td>
    <td>The amount of speed / turn / sidle given to the actuators in the last step.</td>
  </tr>
  <tr>
    <td>prevSpeedAttempted / prevTurnAttempted / prevSidleAttempted</td>
    <td>Number</td>
    <td>
      The amount of speed / turn / sidle that they agent attempted in the last turn. Your script can ask for anything it
      wants, but what actually is attempted is subject to things like physiological constraints, fatigue, or illness.
    </td>
  </tr>
  <tr>
    <td>prevVelocityAchieved</td>
    <td>Vec2</td>
    <td>
      The x/y translational change WRT the agent's nose that was achieved in the last turn. The agent can attempt
      movement, but may be blocked by an obstacle or restricted by terrain.
    </td>
  </tr>
  <tr>
    <td>prevAngularVelocityAchieved</td>
    <td>Number</td>
    <td>
      The instantaneous angular velocity that was achieved in the last turn. The agent can attempt to turn, but may be
      restricted by terrain.
    </td>
  </tr>
</table>
