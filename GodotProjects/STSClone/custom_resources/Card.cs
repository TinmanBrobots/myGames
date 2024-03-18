using Godot;
using System;

[GlobalClass]
public partial class Card : Resource {
    enum Type {ATTACK, SKILL, POWER};
    enum Target {SELF, SINGLE_ENEMY, ALL_ENEMIES, EVERYONE}

    [ExportGroup("CardAttributes")]
    [Export] String id;
    [Export] Type type;
    [Export] Target target;

    public Boolean IsSingleTargeted() {
        return target == Target.SINGLE_ENEMY;
    }
}
