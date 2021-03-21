import Tunnel from "./Tunnel";

export default interface PriorityTunnelInterface extends Tunnel {
    assignPriority(priority: number);
}