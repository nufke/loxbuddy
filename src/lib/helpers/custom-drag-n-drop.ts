/** Customized Drag-and-Drop API
 *
 * The HTML5 drag-and-drop API shows the draggable item in 50% transparency,
 * which makes is difficult to read on a mobile device.
 * This API shows the draggable item in its regular shape, without transparency,
 * and at the same time adds transparancy to the target image or the drop location.
 */
export function customdnd(node: any) {
	let offset: any;

	const dragStart = (ev: any) => {
		const hideDragImage = ev.target.cloneNode(true);
		const c = node.firstElementChild;
		const pos = c.getBoundingClientRect();
		hideDragImage.id = 'hideDragImage';
		const dragImage = ev.target.cloneNode(true);
		dragImage.id = 'dragImage';
		dragImage.style.position = 'absolute';
		offset = { x: ev.clientX - pos.x, y: ev.clientY - pos.y };
		hideDragImage.style.opacity = 0;
		document.body.appendChild(hideDragImage);
		document.body.appendChild(dragImage);
	};

	const onDrag = (ev: any) => {
		const dragImage = document.getElementById('dragImage');
		ev.target.style.opacity = 0.2; // somewhat hide start/end location
		if (dragImage) {
			dragImage.style.left = (ev.pageX - offset.x) + 'px';
			dragImage.style.top = Math.floor(ev.pageY - offset.y) + 'px';
			dragImage.style.width = node.clientWidth + 'px';
			dragImage.style.pointerEvents = 'none';
			dragImage.style.zIndex = '999999';
			dragImage.style.cursor = 'move';
		}
	};

	const dragEnd = (ev: any) => {
		ev.target.style.opacity = 1; // somewhat hide start/end tile
		const hideDragImage = document.getElementById('hideDragImage');
		const dragImage = document.getElementById('dragImage');
		hideDragImage?.remove();
		dragImage?.remove();
	};

	node.addEventListener('dragstart', dragStart);
	node.addEventListener('dragend', dragEnd);
	node.addEventListener('drag', onDrag);
}
