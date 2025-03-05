import { useEffect, useRef } from "react";

const useOutsideClick = (callback, excludeRef) => {
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                ref.current &&
                !ref.current.contains(event.target) &&
                (!excludeRef?.current || !excludeRef.current.contains(event.target))
            ) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [callback, excludeRef]);

    return ref;
};

export default useOutsideClick;
