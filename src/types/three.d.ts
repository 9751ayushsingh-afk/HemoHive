import { Object3DNode } from '@react-three/fiber';
import { InstancedMesh, CapsuleGeometry, SphereGeometry } from 'three';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            instancedMesh: Object3DNode<InstancedMesh, typeof InstancedMesh>;
            capsuleGeometry: Object3DNode<CapsuleGeometry, typeof CapsuleGeometry>;
            sphereGeometry: Object3DNode<SphereGeometry, typeof SphereGeometry>;
        }
    }
}
