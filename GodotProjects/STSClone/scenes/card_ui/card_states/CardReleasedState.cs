using Godot;
using System;
using System.Diagnostics;
// using myNamespace;

public partial class CardReleasedState : CardState {

    private Boolean played;

    public override void Enter() {
        cardUI.GetNode<ColorRect>("Color").Color = new Color("Purple");
        cardUI.GetNode<Label>("State").Text = "RELEASED";
        played = false;

        if (cardUI.targets.Count != 0) {
            played = true;
            Trace.WriteLine("Play card for target(s):", cardUI.targets.ToString());
        }
    }

    public override void OnInput(InputEvent @event) {
        if (played) return;

        EmitSignal(nameof(TransitionRequested), this, (int)CardState.State.BASE);
    }
}
